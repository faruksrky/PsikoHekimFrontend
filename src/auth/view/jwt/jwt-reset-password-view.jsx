import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PasswordIcon } from 'src/assets/icons';

import { Form, Field } from 'src/components/hook-form';

import { resetPassword } from '../../context/jwt';
import { FormHead } from '../../components/form-head';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email adresi girilmelidir!' })
    .email({ message: 'Geçerli bir email adresi girilmelidir!' }),
});

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const router = useRouter();

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword({ username: data.email });

      const searchParams = new URLSearchParams({ email: data.email }).toString();

      const href = `${paths.auth.amplify.updatePassword}?${searchParams}`;
      router.push(href);
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text
        autoFocus
        name="email"
        label="Email Adres"
        placeholder="example@gmail.com"
        InputLabelProps={{ shrink: true }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Gönderiliyor..."
      >
        Gönder
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="Şifrenizi mi unuttunuz ?"
        description="Hesabınızla ilişkili e-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.."
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <FormReturnLink href={paths.auth.jwt.signIn} />
    </>
  );
}
