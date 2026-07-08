from rest_framework import serializers


class GuestDataSummarySerializer(serializers.Serializer):
    created_events = serializers.IntegerField()
    participated_events = serializers.IntegerField()


class GuestEventSerializer(serializers.Serializer):
    url_code = serializers.CharField()
    title = serializers.CharField()


class GuestParticipationSerializer(serializers.Serializer):
    url_code = serializers.CharField()
    title = serializers.CharField()
    guest_display_name = serializers.CharField()
    account_display_name = serializers.CharField(allow_null=True)


class GuestDataSerializer(serializers.Serializer):
    created_events = serializers.ListField(
        child=GuestEventSerializer(),
        allow_empty=True,
    )
    participated_events = serializers.ListField(
        child=GuestParticipationSerializer(),
        allow_empty=True,
    )


class GuestImportDataSerializer(serializers.Serializer):
    availability_choices = serializers.DictField(
        required=True,
        child=serializers.ChoiceField(required=True, choices=["guest", "account"]),
        allow_empty=True,
    )
