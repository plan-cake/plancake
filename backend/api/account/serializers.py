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


class ActiveSessionSerializer(serializers.Serializer):
    public_id = serializers.UUIDField(required=True)
    device_type = serializers.CharField(required=False, allow_null=True, default=None)
    os_name = serializers.CharField(required=False, allow_null=True, default=None)
    os_version = serializers.CharField(required=False, allow_null=True, default=None)
    client_name = serializers.CharField(required=False, allow_null=True, default=None)
    client_version = serializers.CharField(
        required=False, allow_null=True, default=None
    )
    last_used = serializers.DateTimeField(required=True)
    is_current = serializers.BooleanField(required=True)


class ActiveSessionListSerializer(serializers.Serializer):
    sessions = serializers.ListField(
        child=ActiveSessionSerializer(), required=True, allow_empty=False
    )
