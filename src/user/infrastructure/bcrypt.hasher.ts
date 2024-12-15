import { PasswordHasher } from '../domain/password.hasher';
import * as bcrypt from 'bcrypt';

export class bycptHasher implements PasswordHasher {
  async hash(password: string, saltRounds: number): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
