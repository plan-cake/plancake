from rest_framework import serializers


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)


class NewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True)


class ResetCodeSerializer(serializers.Serializer):
    reset_code = serializers.RegexField(
        regex=r"^\d{6}$",
        required=True,
        min_length=6,
        max_length=6,
    )


class RegisterAccountSerializer(EmailSerializer, PasswordSerializer):
    pass


class EmailVerifySerializer(EmailSerializer):
    verification_code = serializers.CharField(required=True)


class LoginSerializer(RegisterAccountSerializer):
    remember_me = serializers.BooleanField(default=False, required=False)


class CodeCheckSerializer(EmailSerializer, ResetCodeSerializer):
    pass


class PasswordResetSerializer(
    EmailSerializer, NewPasswordSerializer, ResetCodeSerializer
):
    prune_sessions = serializers.BooleanField(default=False, required=False)


class PasswordChangeSerializer(PasswordSerializer, NewPasswordSerializer):
    prune_sessions = serializers.BooleanField(default=False, required=False)


class AccountDetailsSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    default_display_name = serializers.CharField(
        required=True, allow_null=True, max_length=25
    )
