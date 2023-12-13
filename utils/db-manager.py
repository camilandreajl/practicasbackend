import boto3
import os
import logging

# Initialize logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    # Extract action from the event
    action = event.get('action')

    # Get the RDS instance identifier from environment variables
    db_instance_identifier = os.environ['DB_INSTANCE_IDENTIFIER']

    # Initialize RDS client
    rds_client = boto3.client('rds')

    try:
        if action == 'start':
            # Start the RDS instance
            response = rds_client.start_db_instance(DBInstanceIdentifier=db_instance_identifier)
            logger.info(f"Start request for RDS instance '{db_instance_identifier}' initiated. Response: {response}")

        elif action == 'stop':
            # Stop the RDS instance
            response = rds_client.stop_db_instance(DBInstanceIdentifier=db_instance_identifier)
            logger.info(f"Stop request for RDS instance '{db_instance_identifier}' initiated. Response: {response}")

        else:
            logger.warning(f"Received unknown action '{action}' for RDS instance '{db_instance_identifier}'.")

    except Exception as e:
        logger.error(f"Error handling '{action}' action for RDS instance '{db_instance_identifier}': {e}", exc_info=True)
        raise e

