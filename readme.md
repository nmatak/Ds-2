docker run -d --hostname localhost --name jokes -p 8080:15672 -p 5672:5672 rabbitmq:3-management
docker ps // to verify that the rabbitmq is running
so you have seen the rabbitmq is running on http://localhost:5672/
username: guest
password: guest

Install RabbitMQ on local machine: Open Windows PowerShell and use this command: choco install rabbitmq