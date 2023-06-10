# Instructions to add template to AWS SES

create a json file for email template

add in the following

````{
  "Template": {
    "TemplateName": "templateName",
    "SubjectPart": "Template Email Subject",
    "HtmlPart": "<p>Any html elements here</p>",
    "TextPart": "embed your email body with variables like {{thisVariable}}"
  }
}```

aws ses create-template --cli-input-json file://templateName.json

Template name and variables in text part will be referenced/set in sendtemplateemail method
````
