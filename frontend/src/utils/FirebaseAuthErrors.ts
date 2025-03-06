import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';

export const getAuthErrorMessage = (error: any): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case AuthErrorCodes.USER_DELETED:
        return 'Usuário não encontrado.';
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        return 'Credenciáis Inválidas';
      case AuthErrorCodes.INVALID_EMAIL:
        return 'Email inválido.';
      case AuthErrorCodes.INVALID_PASSWORD:
        return 'Senha incorreta.';
      case AuthErrorCodes.EMAIL_EXISTS:
        return 'Este email já está em uso.';
      case AuthErrorCodes.OPERATION_NOT_ALLOWED:
        return 'Operação não permitida.';
      case AuthErrorCodes.WEAK_PASSWORD:
        return 'Senha muito fraca. Use uma senha mais forte.';
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        return 'Muitas tentativas de login. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro ao fazer login. Tente novamente.';
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};
