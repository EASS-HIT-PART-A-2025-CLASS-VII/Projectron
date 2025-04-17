from datetime import datetime, timedelta
from typing import Any, Dict
from app.db.models.auth import User
from app.db.models.project import Project
from bson.objectid import ObjectId
from mongoengine.errors import InvalidQueryError, DoesNotExist
from app.db.models.project import Milestone, Task, Subtask
from app.pydantic_models.project_http_models import PlanGenerationInput
from app.utils.mongo_encoder import serialize_mongodb_doc


async def get_structured_project(project_id: str, current_user=None):
    """
    Get a complete structured representation of a project with all its
    nested milestones, tasks, and subtasks.
    
    Args:
        project_id: The string ID of the project to retrieve
        current_user: Optional user for access control checks
        
    Returns:
        A fully structured JSON-compatible dictionary with all project details
        
    Raises:
        ValueError: For invalid project ID format
        DoesNotExist: If project not found
        PermissionError: If current_user doesn't have access to the project
    """
    try:
        # Convert string ID to ObjectId for MongoDB query
        project = Project.objects(id=ObjectId(project_id)).first()
    except InvalidQueryError:
        raise ValueError(f"Invalid project ID format: {project_id}")
    except DoesNotExist:
        raise DoesNotExist(f"Project with ID {project_id} not found")
    
    # Check access permissions if a user was provided
    if current_user:
        owner_id_str = str(project.owner_id.id) if hasattr(project.owner_id, 'id') else str(project.owner_id)
        current_user_id_str = str(current_user.id)
        collaborator_ids_str = [str(c.id) if hasattr(c, 'id') else str(c) for c in project.collaborator_ids]
        
        if owner_id_str != current_user_id_str and current_user_id_str not in collaborator_ids_str:
            raise PermissionError("Not authorized to access this project")
    
    # Build the basic project structure
    project_dict = project.to_mongo().to_dict()
    project_dict['id'] = str(project.id)
    if '_id' in project_dict:
        del project_dict['_id']
    
    # Get all milestones for this project
    milestones = Milestone.objects(project_id=project.id).order_by('order')
    
    # Build complete structure
    milestones_list = []
    
    for milestone in milestones:
        milestone_dict = milestone.to_mongo().to_dict()
        milestone_dict['id'] = str(milestone.id)
        if '_id' in milestone_dict:
            del milestone_dict['_id']
        
        # Get tasks for this milestone
        tasks = Task.objects(milestone_id=milestone.id).order_by('order')
        tasks_list = []
        
        for task in tasks:
            task_dict = task.to_mongo().to_dict()
            task_dict['id'] = str(task.id)
            if '_id' in task_dict:
                del task_dict['_id']
            
            # Convert dependency IDs to strings
            if 'dependency_ids' in task_dict and task_dict['dependency_ids']:
                task_dict['dependency_ids'] = [str(dep_id) for dep_id in task_dict['dependency_ids']]
            
            # Get subtasks for this task
            subtasks = Subtask.objects(task_id=task.id).order_by('order')
            subtasks_list = []
            
            for subtask in subtasks:
                subtask_dict = subtask.to_mongo().to_dict()
                subtask_dict['id'] = str(subtask.id)
                if '_id' in subtask_dict:
                    del subtask_dict['_id']
                subtasks_list.append(subtask_dict)
            
            # Add subtasks to task
            task_dict['subtasks'] = subtasks_list
            tasks_list.append(task_dict)
        
        # Add tasks to milestone
        milestone_dict['tasks'] = tasks_list
        milestones_list.append(milestone_dict)
    
    # Add milestones to project
    project_dict['milestones'] = milestones_list
    
    # Calculate overall project statistics
    total_tasks = sum(len(milestone_dict['tasks']) for milestone_dict in milestones_list)
    completed_tasks = sum(
        sum(1 for task in milestone_dict['tasks'] if task.get('status') == 'completed')
        for milestone_dict in milestones_list
    )
    
    project_dict['task_count'] = total_tasks
    project_dict['completed_task_count'] = completed_tasks
    project_dict['milestone_count'] = len(milestones_list)
    
    if total_tasks > 0:
        project_dict['completion_percentage'] = round((completed_tasks / total_tasks) * 100, 2)
    else:
        project_dict['completion_percentage'] = 0
    
    # Serialize all MongoDB objects to avoid JSON encoding issues
    return serialize_mongodb_doc(project_dict)


async def create_or_update_project_from_plan(project_data:Dict[Any, Any], current_user:User, input_data:PlanGenerationInput, existing_project_id: str = None):
    """Create a new project or update an existing project from AI-generated plan"""
    try:
        project = None
        
        if existing_project_id:
            # This is a refinement of an existing project
            project = Project.objects(id=ObjectId(existing_project_id)).first()
            if not project:
                raise Exception(f"Project with ID {existing_project_id} not found")
            
            # Clean up existing milestones, tasks, and subtasks
            await clean_project_data(project.id)
            
            # Update the project with new plan data
            project.name = input_data.get("name", project_data.get("name", "Untitled Project"))
            project.description = project_data.get("description", project.description)
            project.tech_stack = project_data.get("tech_stack", project.tech_stack)
            project.experience_level = input_data.get("experience_level", project.experience_level)
            project.team_size = input_data.get("team_size", project.team_size)
            project.status = project_data.get("status", project.status)
            
            # Update with enhanced plan data
            
            project.high_level_plan = project_data.get("high_level_plan", {})
            project.technical_architecture = project_data.get("technical_architecture", {})
            project.api_endpoints = project_data.get("api_endpoints", {})
            project.data_models = project_data.get("data_models", {})
            project.ui_components = project_data.get("ui_components", {})
            
            project.updated_at = datetime.now()
            project.save()
            
        else:
            # Create a new project
            project = Project(
                name=input_data.get("name", project_data.get("name", "Untitled Project")),
                description=project_data.get("description", ""),
                tech_stack=project_data.get("tech_stack", []),
                experience_level=project_data.get("experience_level", "junior"),
                team_size=input_data.get("team_size", 1),
                status=project_data.get("status", "draft"),
                owner_id=current_user.id,

                
                high_level_plan=project_data.get("high_level_plan", {}),
                technical_architecture=project_data.get("technical_architecture", {}),
                api_endpoints=project_data.get("api_endpoints", {}),
                data_models=project_data.get("data_models", {}),
                ui_components=project_data.get("ui_components", {}),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            project.save()
        
        project_id = str(project.id)
        
        # Create milestones from the plan
        milestones_data = project_data.get("implementation_plan", [])
        milestones_dict = {}  # Store milestone objects for reference
        
        for i, milestone_data in enumerate(milestones_data):
            # Calculate due date if due_date_offset is provided
            due_date = None
            if "due_date_offset" in milestone_data:
                due_date = datetime.now() + timedelta(days=milestone_data["due_date_offset"])
            
            milestone = Milestone(
                project_id=project.id,
                name=milestone_data.get("name", f"Milestone {i+1}"),
                description=milestone_data.get("description", ""),
                status=milestone_data.get("status", "not_started"),
                due_date=due_date,
                order=i
            )
            milestone.save()
            
            # Store the milestone for reference when creating tasks
            milestones_dict[milestone_data.get("name")] = milestone
            
            # Create tasks for this milestone
            tasks_dict = {}  # Store task objects for reference
            
            for j, task_data in enumerate(milestone_data.get("tasks", [])):
                # Calculate due date if due_date_offset is provided
                task_due_date = None
                if "due_date_offset" in task_data:
                    task_due_date = datetime.now() + timedelta(days=task_data["due_date_offset"])
                elif due_date:
                    # If task has no due date but milestone does, use milestone's due date
                    task_due_date = due_date
                
                task = Task(
                    project_id=project.id,
                    milestone_id=milestone.id,
                    name=task_data.get("name", f"Task {j+1}"),
                    description=task_data.get("description", ""),
                    status=task_data.get("status", "not_started"),
                    priority=task_data.get("priority", "medium"),
                    estimated_hours=task_data.get("estimated_hours", 0),
                    components_affected=task_data.get("components_affected", []),
                    apis_affected=task_data.get("apis_affected", []),
                    due_date=task_due_date,
                    order=j
                )
                task.save()
                
                # Store the task for reference when creating subtasks or dependencies
                tasks_dict[task_data.get("name")] = task
                
                # Create subtasks
                for k, subtask_data in enumerate(task_data.get("subtasks", [])):
                    subtask = Subtask(
                        task_id=task.id,
                        name=subtask_data.get("name", f"Subtask {k+1}"),
                        status=subtask_data.get("status", "not_started"),
                        description=subtask_data.get("description", ""),
                        order=k
                    )
                    subtask.save()
            
            # Set up task dependencies after all tasks are created
            for j, task_data in enumerate(milestone_data.get("tasks", [])):
                if "dependencies" in task_data and task_data["dependencies"]:
                    task = tasks_dict.get(task_data.get("name"))
                    if task:
                        dependency_ids = []
                        for dep_name in task_data["dependencies"]:
                            if dep_name in tasks_dict:
                                dependency_ids.append(tasks_dict[dep_name].id)
                        
                        if dependency_ids:
                            # Update the task with dependencies
                            task.dependency_ids = dependency_ids
                            task.save()
        
        return project_id
        
    except Exception as e:
        # If anything fails during creation of a new project, clean up
        if not existing_project_id and 'project' in locals() and project:
            await clean_project_data(project.id)
            project.delete()
            
        # Re-raise the exception
        raise Exception(f"Failed to create/update project from plan: {str(e)}")



async def get_milestones_from_db(project_id):
    """Convert milestones, tasks, and subtasks from DB into JSON format for AI processing"""
    milestones = []
    
    for milestone in Milestone.objects(project_id=project_id):
        milestone_dict = {
            "name": milestone.name,
            "description": milestone.description,
            "status": milestone.status,
            "due_date_offset": (milestone.due_date - datetime.now()).days if milestone.due_date else 30,
            "tasks": []
        }
        
        for task in Task.objects(milestone_id=milestone.id):
            task_dict = {
                "name": task.name,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "estimated_hours": task.estimated_hours,
                "dependencies": [],
                "components_affected": task.components_affected,
                "apis_affected": task.apis_affected,
                "subtasks": []
            }
            
            # Get task dependencies
            if task.dependency_ids:
                for dep_id in task.dependency_ids:
                    dep_task = Task.objects(id=dep_id).first()
                    if dep_task:
                        task_dict["dependencies"].append(dep_task.name)
            
            # Get subtasks
            for subtask in Subtask.objects(task_id=task.id):
                subtask_dict = {
                    "name": subtask.name,
                    "status": subtask.status,
                    "description": subtask.description
                }
                task_dict["subtasks"].append(subtask_dict)
            
            milestone_dict["tasks"].append(task_dict)
        
        milestones.append(milestone_dict)
    
    return milestones


async def clean_project_data(project_id: str):
    """Delete all milestones, tasks, and subtasks for a project"""
    try:
        # Get all milestones for this project
        milestones = Milestone.objects(project_id=project_id)
        
        # For each milestone, get and delete tasks and subtasks
        for milestone in milestones:
            tasks = Task.objects(milestone_id=milestone.id)
            for task in tasks:
                # Delete subtasks
                Subtask.objects(task_id=task.id).delete()
            
            # Delete tasks for this milestone
            Task.objects(milestone_id=milestone.id).delete()
        
        # Delete all milestones
        Milestone.objects(project_id=project_id).delete()
        
    except Exception as e:
        raise Exception(f"Failed to clean project data: {str(e)}")

