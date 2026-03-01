const requireLevel = (minLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'No autenticado.' });
        }

        if (req.user.nivel < minLevel) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere nivel ${minLevel} o superior. Su nivel actual es ${req.user.nivel}.`
            });
        }
        
        next();
    };
};

module.exports = { requireLevel };
