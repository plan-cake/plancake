from rest_framework import serializers


class AuthedPasswordResetCodeSerializer(serializers.Serializer):
    reset_code = serializers.RegexField(
        regex=r"^\d{6}$",
        required=True,
        min_length=6,
        max_length=6,
    )


class AuthedPasswordResetSerializer(AuthedPasswordResetCodeSerializer):
    new_password = serializers.CharField(required=True)
    prune_sessions = serializers.BooleanField(default=False, required=False)
