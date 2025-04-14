var jwt= require('jsonwebtoken')
const JWT_SECRET='Hussainissex$y'

// const fetchUser=(req, res, next)=>{
//     const token=req.header('auth-token')
//     if (!token) {
//         return res.status(401).send({error:"Please authenticate using right token"})
//     }
//     try {
//         const data  = jwt.verify(token, JWT_SECRET)
//         req.user=data.user
//         next();
//     } catch (error) {
//         res.status(401).send({error:"Please authenticate using the right token"})
//     }
// }
const fetchUser=(req, res, next)=>{
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({error:"Please use a valid token key"})
    }
    try {
        const data= jwt.verify(token, JWT_SECRET)
        req.user=data.user
        next()
    } catch (error) {
        res.status(401).send({error:"Please use a valid token key"})
    }
}
module.exports= fetchUser;