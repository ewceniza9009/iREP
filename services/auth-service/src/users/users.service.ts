import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export type User = {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  roles: string[];
};

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    this.users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@acme.realty.com',
        passwordHash: passwordHash,
        roles: ['admin'],
      },
      // ...
    ];
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}