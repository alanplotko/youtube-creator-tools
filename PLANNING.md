# Planning

## Process

### A. Project Creation Flow (Uploaded via YouTube.com)

1. Create a Project, e.g. Triangle Strategy
2. Have you already uploaded all videos in scope of project?
    - Yes -> Proceed to #3 (search)
    - No -> Proceed to section B
3. Search, max results = 50, type = video, query by name, e.g. "ts-" since title defaults to file name
    - https://developers.google.com/youtube/v3/docs/search/list
4. Select videos in scope to verify results and persist video IDs for said project
5. Generate CSV file with IDs and columns to update. Populate locally by hand.
6. Reupload and verify CSV fields. Ensure thumbnails are within bounds (2MB limit). Collect user confirmation that data looks correct. Estimate quota and ensure action is in bounds of completion. Block otherwise, or ask user to confirm that it's ok to proceed with as many updates as possible. Resume function when more units available on next refresh.
    - https://developers.google.com/youtube/v3/docs/videos/update
    - https://developers.google.com/youtube/v3/docs/thumbnails/set

### B. Upload Flow

WIP

## Quota Usage

### Flow A

Limit = 10K per day
    search/list -> 100 for 50 videos max
    videos/update -> 50 per video
    thumbnails/set -> 50 per video

    Q = 100V + 100, e.g. V = 25, 100(25) + 100 = 2600 / 10K

### Flow B
Limit = 10K per day
    videos/insert -> 1600 per video, includes metadata
    thumbnails/set -> 50 per video

    Q = 1650V, e.g. V = 25, 1650(25) = 41,250 / 10K = 5 days to complete