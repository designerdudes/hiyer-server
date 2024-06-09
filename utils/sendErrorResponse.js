 // Helper function to handle common error response
 export const sendErrorResponse = (res, error) => {
    res.status(400).json({ message: error.message });
  };