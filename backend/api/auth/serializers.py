from rest_framework import serializers

SIX_DIGIT_CODE_FIELD = serializers.RegexField(
    regex=r"^\d{6}$",
    required=True,
    min_length=6,
    max_length=6,
)


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class RegisterAccountSerializer(EmailSerializer):
    password = serializers.CharField(required=True)


class VerificationCodeSerializer(EmailSerializer):
    verification_code = SIX_DIGIT_CODE_FIELD


class LoginSerializer(RegisterAccountSerializer):
    remember_me = serializers.BooleanField(default=False, required=False)


class PasswordResetSerializer(VerificationCodeSerializer):
    new_password = serializers.CharField(required=True)
    prune_sessions = serializers.BooleanField(default=False, required=False)


class AccountDetailsSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    default_display_name = serializers.CharField(
        required=True, allow_null=True, max_length=25
    )
