import {
  Controller,
  Request as resqu,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SetMetadata,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { Roles } from './roles.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import {
  Headers,
  Request,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard, Public } from 'src/auth/jwt-auth.guard';
import { AbilityFactory } from 'src/ability/ability.factory/ability.factory';
import { AbilityAction, UserType } from './user.model';
import { User, UserCl } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AbilityGuard } from './ability.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { CheckAbility } from 'src/ability/ability.factory/ability.decorator';
import { BypassAuth } from './bypass';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly abilityFactory: AbilityFactory,
    @InjectModel('User') private readonly userModel: Model<UserType>,
  ) { }

  // @SetMetadata('roles', [Role.ADMIN])
  // @Roles(Role.ADMIN)
  @Post()
  // @UseGuards(JwtAuthGuard)
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'user' })
  async create(@Body() createUserDto: CreateUserDto) {
    // const ability = this.abilityFactory.defineAbility()
    // password: CryptoJS.AES.encrypt(
    //   req.body.password,
    //   process.env.PASS_SEC
    // ).toString(),
    // const user: UserType = await this.userModel.findById('');
    // const ability = this.abilityFactory.defineAbility(user);
    const newRecord = await this.usersService.create(createUserDto);
    return newRecord;
  }

  @Get()
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: 'user' })
  async findAll() {
    // const user: UserType = await this.userModel.findById('');
    // const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(AbilityAction.Create, User);
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'profile' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }


  @Patch('own/:id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'profile' })
  async updateOwn(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateOwn(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Admin, subject: 'user' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<any> {
    return await this.authService.login(req.user);
  }

  @Get('login/islogin')
  async isLogin(@Headers('authorization') authorization: string): Promise<any> {
    console.log('islogin called', authorization);
    return await this.authService.isLogin(authorization);
    // return req.user;
  }
  @Get('createadmin')
  async createAdmin(@Headers('key') key: string): Promise<any> {
    console.log('islogin called', key);
    return await this.usersService.createAdmin(key)
    // return req.user;
  }
}
