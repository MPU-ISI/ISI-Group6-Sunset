import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        
        // 同时设置req.body.userId和req.user保持兼容性
        req.body.userId = token_decode.id;
        req.user = { _id: token_decode.id };
        
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default authUser