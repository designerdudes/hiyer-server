import jwt from 'jsonwebtoken';  

// Helper function to extract user ID from token
export const getUserIdFromToken = (req) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    return decodedToken.id;
  };
  
 