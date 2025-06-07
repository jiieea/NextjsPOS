import type { NextApiHandler } from "next";

const handler : NextApiHandler = (req , res ) => {
    res.status(200).json({message : "Hello World"})
    console.log(req.body)
}

export default handler;