from mongoengine import (
    Document, StringField, DateTimeField, ReferenceField, ListField,
    DictField, IntField, CASCADE, NULLIFY
)
from datetime import datetime, timezone
from .auth import User


class Project(Document):
    name              = StringField(required=True)
    description       = StringField(default="")
    tech_stack        = ListField(StringField(), default=[])
    experience_level  = StringField(choices=("junior", "mid", "senior"), default="junior")
    team_size         = IntField(min_value=1, default=1)
    status            = StringField(choices=("draft", "active", "completed"), default="draft")

    owner_id          = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    collaborator_ids  = ListField(ReferenceField(User))

    # plan & diagrams
    implementation_plan  = DictField(default={})
    high_level_plan      = DictField(default={})
    technical_architecture = DictField(default={})
    api_endpoints          = DictField(default={})
    data_models            = DictField(default={})
    ui_components          = DictField(default={})
    class_diagram_json   = DictField(default={})
    class_diagram_svg    = StringField(default="")
    activity_diagram_json= DictField(default={})
    activity_diagram_svg = StringField(default="")
    sequence_diagram_source_code = StringField(default="")
    sequence_diagram_svg         = StringField(default="")

    created_at         = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    updated_at         = DateTimeField(default=lambda: datetime.now(tz=timezone.utc))
    extra_meta         = DictField(default={})                   

    meta = {
        "collection": "projects",
        "indexes": [
            {"fields": ["owner_id", "name"], "unique": True}
        ]
    }


