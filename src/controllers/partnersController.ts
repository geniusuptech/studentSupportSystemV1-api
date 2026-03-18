type Request = any; type Response = any; type NextFunction = any;

import { partnersService } from '../services/partnersServices';

const router: any = {};

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await partnersService.getAllPartners(req.query);
    res.json({ success: true, data: partners });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partner = await partnersService.getPartnerById(req.params.id);
    res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
});

// Add other routes as needed

export default router;