const pool = require('../db/db');
const mailer = require('../config/mailer');
const PDFDocument = require('pdfkit');

exports.createOrder = async (req, res) => {
    try {
        const { items, shippingData, total, metodoPago } = req.body;
        
        // Si el carrito está vacío, bye
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "El carrito está vacío" });
        }

        const [orderResult] = await pool.execute(
            'INSERT INTO orders (total) VALUES (?)',
            [total]
        );
        const orderId = orderResult.insertId;
        
        // 2. RESTAR INVENTARIO (Esto sí afecta la BD de productos)
        for (const item of items) {
            // Solo actualizamos el stock del producto
            await pool.execute(
                'UPDATE productos SET stock = stock - ? WHERE product_id = ?',
                [item.cantidad, item.id]
            );
        }

        // 3. GENERAR EL PDF EN MEMORIA
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        
        // --- Diseño del PDF ---
        doc.fillColor('#444444').fontSize(20).text('Tech-Up', 110, 57)
           .fontSize(10).text('Tech-Up S.A. de C.V.', 200, 50, { align: 'right' })
           .text('Aguascalientes, Ags.', 200, 65, { align: 'right' })
           .moveDown();

        doc.text('--------------------------------------------------------------------------');
        doc.moveDown();

        // Info de la Orden
        doc.fillColor('#000000').fontSize(20).text('Nota de Compra', 50, 130);
        doc.fontSize(10).text(`Orden #: ${orderId}`, 50, 160);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 50, 175);
        doc.text(`Método de Pago: ${metodoPago.toUpperCase()}`, 50, 190);

        // Info del Cliente
        doc.text(`Cliente: ${shippingData.nombre}`, 300, 160);
        doc.text(`Email: ${shippingData.email}`, 300, 175);
        doc.text(`Dirección:`, 300, 190);
        doc.font('Helvetica-Oblique').text(shippingData.direccion, 300, 205, { width: 250 });
        doc.font('Helvetica'); 

        doc.moveDown();
        doc.text('--------------------------------------------------------------------------', 50, 250);

        // Tabla de Productos
        let y = 270;
        doc.font('Helvetica-Bold');
        doc.text('Producto', 50, y);
        doc.text('Cant.', 280, y);
        doc.text('Precio Unit.', 350, y);
        doc.text('Total', 450, y, { width: 90, align: 'right' });
        doc.font('Helvetica');
        doc.text('--------------------------------------------------------------------------', 50, y + 10);

        y += 30;
        items.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            // Cortamos el nombre si es muy largo para que no rompa el PDF
            doc.text(item.nombre.substring(0, 35), 50, y);
            doc.text(item.cantidad.toString(), 280, y);
            doc.text(`$${parseFloat(item.precio).toFixed(2)}`, 350, y);
            doc.text(`$${subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
            y += 20;
        });

        // Total Final
        doc.text('--------------------------------------------------------------------------', 50, y);
        y += 20;
        doc.fontSize(14).font('Helvetica-Bold').text(`TOTAL PAGADO: $${parseFloat(total).toFixed(2)}`, 300, y, { align: 'right' });
        
        doc.end(); 
        // ---------------------

        // 4. ENVIAR EL CORREO
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            const htmlBody = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #00e5ff;">¡Gracias por tu compra, ${shippingData.nombre}!</h1>
                    <p>Tu pedido <strong>#${orderId}</strong> ha sido confirmado exitosamente.</p>
                    <p>Adjunto encontrarás tu nota de compra en formato PDF.</p>
                    <hr>
                    <p>Atentamente,<br>El equipo de Tech-Up</p>
                </div>
            `;

            // Usamos el email que puso en el formulario de envío (shippingData.email)
            await mailer.sendEmail(
                shippingData.email, 
                `Confirmación de Pedido #${orderId} - Tech-Up`, 
                htmlBody,
                [{ filename: `Nota_Compra_${orderId}.pdf`, content: pdfData }]
            );
        });

        // 5. RESPONDER AL FRONTEND
        res.status(201).json({
            success: true,
            message: "Orden procesada y nota enviada (Sin guardar en historial)",
            orderId: orderId
        });

    } catch (error) {
        console.error("Error en checkout:", error);
        res.status(500).json({ success: false, message: "Error al procesar la orden en el servidor" });
    }
};