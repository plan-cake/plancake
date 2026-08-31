from rest_framework import serializers

SIX_DIGIT_CODE_FIELD = serializers.RegexField(
    regex=r"^\d{6}$",
    required=True,
    min_length=6,
    max_length=6,
)


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetCodeSerializer(serializers.Serializer):
    reset_code = SIX_DIGIT_CODE_FIELD


class RegisterAccountSerializer(EmailSerializer):
    password = serializers.CharField(required=True)


class EmailVerifySerializer(EmailSerializer):
    verification_code = SIX_DIGIT_CODE_FIELD


class LoginSerializer(RegisterAccountSerializer):
    remember_me = serializers.BooleanField(default=False, required=False)


class CodeCheckSerializer(EmailSerializer, ResetCodeSerializer):
    pass


class PasswordResetSerializer(EmailSerializer, ResetCodeSerializer):
    new_password = serializers.CharField(required=True)
    prune_sessions = serializers.BooleanField(default=False, required=False)


class AccountDetailsSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    default_display_name = serializers.CharField(
        required=True, allow_null=True, max_length=25
    )
