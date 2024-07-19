import { NextFunction, Request, Response } from "express";

export default function LogOut (req: Request, res: Response, next: NextFunction): void {
  req.logout(function(err) {
    if (err) { return next(err); }

		req.session.destroy((err) => {
			if (err) return next(err);

			console.info("Session destroyed.");
			res.redirect('/login');
		});
  });
}