from rest_framework import serializers


class GuestEventSerializer(serializers.Serializer):
    url_code = serializers.CharField()
    title = serializers.CharField()


class GuestParticipationSerializer(serializers.Serializer):
    url_code = serializers.CharField()
    title = serializers.CharField()
    guest_display_name = serializers.CharField()
    account_display_name = serializers.CharField(allow_null=True)


class GuestDataSummarySerializer(serializers.Serializer):
    created_events = serializers.ListField(
        child=GuestEventSerializer(),
        allow_empty=True,
    )
    participated_events = serializers.ListField(
        child=GuestParticipationSerializer(),
        allow_empty=True,
    )
