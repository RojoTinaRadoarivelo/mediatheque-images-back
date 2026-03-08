export class SignedUserDto {
  id: string;
  email: string;
  avatar?: string;
  userName?: string;
  preference?: JSON | null;
}
