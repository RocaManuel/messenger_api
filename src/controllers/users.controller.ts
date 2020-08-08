import { Router, Response } from "express";
import { Auth } from "../guardians/auth";
import telkit from 'terminal-kit';
import bodyParser from 'body-parser';
import { UsersSerivce } from "../services/Users.service";
import { ORMHelper } from "../helper/orm.helper";
import { GeneralHelper } from "../helper/general.helper";
import { ParamsHelper } from "../helper/params.helper";


class UsersController {

  private auth = new Auth();
  private jsonParser = bodyParser.json();

  private usersService = new UsersSerivce();

  private ormHelper = new ORMHelper();
  private generalHelper = new GeneralHelper();
  private paramsHelper = new ParamsHelper();

  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get('/', (req: any, res: Response) => this.login(req, res));
    this.router.post('/', this.jsonParser, this.paramsHelper.validateParams, (req: any, res: Response) => this.register(req, res));
  }

  private async login(req: any, res: Response) {
    try {
      const params = this.ormHelper.formatParamsForWhere(req.query);
      const response = await this.usersService.getUser(params);
      if (!response) res.status(404).json({ error: 'not user found' });

      const { name, lastname, id } = response;
      const token = await this.auth.generateToken({ name, lastname, id });

      return res.status(200).json({ auth: true, response, token });
    } catch (e) {
      telkit.terminal(e);
    }
  }

  private async register(req: any, res: Response) {
    try {
      const user = this.ormHelper.getUserBasics(req.body);
      const response = await this.usersService.postUser(user);
      const { name, lastname, id } = response;
      const token = await this.auth.generateToken({ name, lastname, id });
      return res.status(200).json({ success: true, token, response });
    } catch (e) {
      telkit.terminal(e);
    }
  }

}

const userController = new UsersController();
export default userController.router;