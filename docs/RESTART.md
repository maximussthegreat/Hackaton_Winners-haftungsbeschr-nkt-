# RESTART INSTRUCTIONS

To fully restart the Sentinel System (Brain, Eye, Twin):

1. **Open the Terminal** (Ctrl+J or Terminal > New Terminal).
2. **Paste and Run** this command:

    ```powershell
    powershell -File scripts/start_demo.ps1
    ```

3. **Wait** for the system to initialize (approx. 5-10 seconds).
4. **Verify**:
    - **Eye Window**: Should show "Connected to AisStream".
    - **Brain Window**: Should show "GET / HTTP/1.1 200 OK".
    - **Twin Window**: Should be the Next.js build process.

If you see errors, check `c:\Users\maxim\HackatonJanuary\logs\eye.err.log`.
