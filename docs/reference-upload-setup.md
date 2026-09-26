# Design brief reference uploads

The website code accepts up to three JPG, PNG or WebP reference images of 1.5 MiB each after a design brief has been saved. The upload token is signed for the saved lead and expires after one hour. Images are kept in a private Google Drive folder; the References sheet records their file IDs. The customer can still use WhatsApp when uploads are unavailable.

## Owner setup before enabling

1. Create a private Google Drive folder for invitation reference images. Do not enable public link sharing. Copy its folder ID.
2. In the existing lead Google Apps Script project, replace the script with `docs/lead-apps-script.gs`. Add script property `REFERENCE_FOLDER_ID` with that folder ID, and ensure `SHARED_SECRET` matches Vercel `LEAD_SHARED_SECRET`.
3. Deploy a **new version** of the existing Apps Script web app (execute as the owner). Authorize the Drive scope when Google asks. Keep the resulting URL in Vercel `LEAD_APPS_SCRIPT_URL`; update it there if the deployment URL changed.
4. In Vercel, set `REFERENCE_UPLOAD_ENABLED=true` for the desired environment and redeploy. Enable this only after the Apps Script version and private folder are ready.
5. Submit a real test design brief, upload one small reference image, and check that its lead ID and private Drive file ID appear in the References sheet. Test a rejected fourth image and an unavailable upload response. Remove the test lead and image afterward as appropriate.

The website endpoint never returns a public Drive URL. Keep the folder restricted to staff. The site privacy page discloses image storage. Production deployment and the Google account changes require the owner; repository checks only exercise local/mocked paths.
