import {userRegistrationService,loginUserService} from "../services/authService.js";

export const registerUser = async(req,res)=>{
    const {name,email, password} = req.body;

    try {
        if(!email || !password){
          return res.status(409).json({
            message: "Both email and password are required"
            });
        }

       const registeredUser = await userRegistrationService(name,email,password);
       res.status(201).json({
       message : "User Created",
       user : {
        name : registeredUser.name,
        id : registeredUser.id,
        email : registeredUser.email,
        created_at : registeredUser.created_at
       }
       });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message : "Server Error"
        });
    }
};


export const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({
                message : "Both Email and password required"
            });
        }
        const userLogin = await loginUserService(email,password)
        res.status(200).json({
            message : "User Loggedin", userLogin})
    }  catch (error) {
  if (error.message === "Invalid Credentials") {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  console.error("Login failed:", error.message);

  return res.status(500).json({
    message: "Server Error",
  });
}
}