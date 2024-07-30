import { NextFunction, Response, Request } from "express";

export default function LogOut (req: Request, res: Response, next: NextFunction): void {

	if ("session" in req) {
		console.log("Logging out user:", req.session.user);

		req.session.destroy(err => {
			if (err) return next(err);

			console.info("Session destroyed.");
		});
	}

	res.redirect("/login");
}