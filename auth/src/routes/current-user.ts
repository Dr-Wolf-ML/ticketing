import express from 'express';

import { currentUser } from '@dr-wolf-at-npm/common-for-tix';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
