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


class Milestone(Document):
    project_id   = ReferenceField(Project, required=True, reverse_delete_rule=CASCADE)
    name         = StringField(required=True)
    description  = StringField()
    due_date     = DateTimeField()
    status       = StringField(choices=("not_started", "in_progress", "completed"), default="not_started")
    order        = IntField(default=0)

    meta = {
        "collection": "milestones",
        "indexes": [
            {"fields": ["project_id", "order"], "unique": True}
        ]
    }


class Task(Document):
    project_id    = ReferenceField(Project, required=True, reverse_delete_rule=CASCADE)
    milestone_id  = ReferenceField(Milestone, required=True, reverse_delete_rule=CASCADE)
    name          = StringField(required=True)
    description   = StringField()
    assignee_id   = ReferenceField(User)
    due_date      = DateTimeField()
    status        = StringField(choices=("not_started", "in_progress", "completed"), default="not_started")
    priority      = StringField(choices=("low", "medium", "high"), default="medium")
    estimated_hours = IntField(min_value=0)
    dependency_ids  = ListField(
        ReferenceField("self", reverse_delete_rule=NULLIFY)
    )
    components_affected = ListField(StringField(), default=[])
    apis_affected       = ListField(StringField(), default=[])
    order               = IntField(default=0)

    meta = {
        "collection": "tasks",
        "indexes": [
            {"fields": ["project_id", "status"]},
            "milestone_id",
            "due_date"
        ]
    }


class Subtask(Document):
    task_id      = ReferenceField(Task, required=True, reverse_delete_rule=CASCADE)
    name         = StringField(required=True)
    status       = StringField(choices=("not_started", "in_progress", "completed"), default="not_started")
    assignee_id  = ReferenceField(User)
    description  = StringField(default="")
    order        = IntField(default=0)

    meta = {"collection": "subtasks", "indexes": ["task_id"]}
