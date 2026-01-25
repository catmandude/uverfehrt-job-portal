# Bulk Job Upload Feature

## Overview
The CreateJob component now supports uploading multiple jobs at once via an Excel (.xlsx) file. This feature allows administrators to create many jobs efficiently by preparing them in a spreadsheet.

## How to Use

### Step 1: Prepare Your Excel File
Your Excel file must have the following columns (column names must match exactly):

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| Email | Yes | Email of the user who will be assigned the job. Must match an existing user in the system. | john.doe@example.com |
| Customer | Yes | Name of the customer | Acme Corporation |
| Job Name | Yes | Job name or sales order number | SO-2024-001 |
| Location | Yes | Physical location where work will be performed | 123 Main St, Springfield, IL 62701 |
| Description | Yes | Detailed description of the work to be done | Installation of electrical systems in new building wing |
| Links | No | Comma-separated URLs to manuals or resources | https://example.com/manual1.pdf, https://example.com/manual2.pdf |

### Step 2: Create a Template
You can generate a template file by running:

```bash
node scripts/create-job-template.js
```

This will create a file `public/job-upload-template.xlsx` with example data that you can use as a starting point.

### Step 3: Upload the File
1. Navigate to the **Create New Job** page in the admin section
2. Click the **Upload bulk jobs (.xlsx)** file input in the top-right corner
3. Select your prepared Excel file
4. The system will automatically parse and validate the data

### Step 4: Preview and Confirm
After uploading, a modal will appear showing:
- Number of jobs to be created
- A table preview of all jobs with their details
- User assignments, customers, job names, locations, descriptions, and links

Review the information carefully and click **Create X Job(s)** to proceed, or **Cancel** to abort.

### Step 5: Completion
The system will:
- Create each job sequentially
- Show a notification with the number of successfully created jobs
- Report any failures (e.g., if a user email doesn't exist)
- Clear the upload form for the next batch

## Important Notes

⚠️ **User Email Validation**: The Email field must exactly match an existing user's email in your system. Jobs with invalid or non-existent emails will be filtered out.

⚠️ **Required Fields**: All fields except "Links" are required. Rows with missing required fields will be skipped.

⚠️ **File Format**: Only .xlsx and .xls files are accepted.

⚠️ **Data Validation**: The system validates data before creation. Invalid entries are filtered out and you'll be notified.

## Example Template Structure

```
| Email                  | Customer        | Job Name    | Location                          | Description                          | Links                               |
|------------------------|-----------------|-------------|-----------------------------------|--------------------------------------|-------------------------------------|
| john.doe@example.com   | Acme Corp       | SO-2024-001 | 123 Main St, Springfield, IL      | Install electrical systems           | https://example.com/manual1.pdf     |
| jane.smith@example.com | Tech Industries | SO-2024-002 | 456 Oak Ave, Chicago, IL          | HVAC maintenance and repair          | https://example.com/hvac-manual.pdf |
```

## Troubleshooting

**Problem**: No jobs appear in the preview modal
- **Solution**: Check that all required fields are filled and email addresses match existing users

**Problem**: Some jobs are missing from the preview
- **Solution**: Those jobs likely had validation errors. Check for missing required fields or invalid email addresses

**Problem**: Upload fails with an error
- **Solution**: Ensure the file is a valid Excel file (.xlsx or .xls) and follows the correct format

## Technical Details

The bulk upload feature:
- Uses the `xlsx` library to parse Excel files
- Validates data against existing users
- Shows a preview in a Mantine Modal component
- Creates jobs sequentially using the existing `jobsApi.createNewJobForUser` method
- Provides detailed success/failure notifications
