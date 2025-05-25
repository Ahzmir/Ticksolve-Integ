const { rateLimit} = require('express-rate-limit');

const limiter1 = rateLimit({
    windowMs: 1* 60 * 1000, // 1 minute,
    max: 5,
    message: (_req: any, res: { json: (arg0: { message: string; }) => any; }) => {
        return res.json({ message: "You have made too many requests. Please try again later."})
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
})

module.exports = { limiter1}