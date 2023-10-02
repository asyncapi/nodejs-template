# Include docker commands to spawn docker containers for brokers (amqp, mqtt, kafka, etc ...)
# Internally this will be run before running the integration tests

docker run -it -p 1883:1883 eclipse-mosquitto:1.5
