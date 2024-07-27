import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "src/Server";

export default function LogOut (req: AuthenticatedRequest, res: Response, next: NextFunction): void {
	console.log("Logging out user:", req.session.user);

	req.session.destroy(err => {
		if (err) return next(err);

		console.info("Session destroyed.");
		res.redirect("/login");
	});
}