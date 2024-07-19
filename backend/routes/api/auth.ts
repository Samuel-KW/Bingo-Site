import { Router } from "express";

import LogIn from "../../routes/api/login";
import SignUp from "../../routes/api/signup";
import LogOut from "../../routes/api/logout";

// Initialize the router
const router = Router();

router.post("/api/login", LogIn);
router.post("/api/signup", SignUp);
router.post('/api/logout', LogOut);
console.log("\tInitialized authentication routes.");

export default router;