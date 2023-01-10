import {
  Controller,
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
import { Request } from '@nestjs/common/decorators/http/route-params.decorator';
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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly abilityFactory: AbilityFactory,
    @InjectModel('User') private readonly userModel: Model<UserType>,
  ) {}

  // @SetMetadata('roles', [Role.ADMIN])
  // @Roles(Role.ADMIN)
  @Post()
  // @UseGuards(JwtAuthGuard)
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: User })
  async create(@Body() createUserDto: CreateUserDto) {
    // const ability = this.abilityFactory.defineAbility()
    // password: CryptoJS.AES.encrypt(
    //   req.body.password,
    //   process.env.PASS_SEC
    // ).toString(),
    // const user: UserType = await this.userModel.findById('');
    // const ability = this.abilityFactory.defineAbility(user);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: User })
  async findAll() {
    // const user: UserType = await this.userModel.findById('');
    // const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(AbilityAction.Create, User);
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Update, subject: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: User })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): any {
    return this.authService.login(req.user);
    // return req.user;
  }
}
