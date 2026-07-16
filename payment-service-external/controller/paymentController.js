exports.processPayment = async (req, res) => {
    console.log("💳 Payment recibió:", req.body);
    try {
        const { order_id, amount } = req.body;
        if ((order_id === undefined || amount === undefined)) {
            return res.status(400).json({
                error: 'order_id y amount son obligatorios'
            });
        }

        if (typeof order_id !== 'number' || typeof amount !== 'number') {
            return res.status(400).json({
                error: 'Formato inválido'
            });
        }

        const success = Math.random() > 0.3;

        if (!success) {
            return res.status(400).json({
                status: 'rejected',
                order_id,
                amount
            });
        }

        // ✅ éxito mantiene 200
        return res.json({
            status: 'approved',
            transactionId: 'tx_' + Date.now(),
            order_id,
            amount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error procesando pago'
        });
    }
};