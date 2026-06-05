import os
from huggingface_hub import HfApi

def push_to_huggingface():
    print("--- Hugging Face Spaces Deployer ---")
    
    # Get user details
    token = input("Enter your Hugging Face WRITE Token (from hf.co/settings/tokens): ").strip()
    username = input("Enter your Hugging Face Username: ").strip()
    
    if not token or not username:
        print("Error: Both Token and Username are required.")
        return

    repo_id = f"{username}/mnist-handwritten-digit-recognizer"
    api = HfApi(token=token)
    
    # Create Space (Gradio SDK)
    print(f"\nCreating or finding Space repo: {repo_id}...")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="gradio",
            private=False,
            exist_ok=True
        )
        print("Repository is ready.")
    except Exception as e:
        print(f"Error creating repository: {e}")
        return

    # Files to upload
    files_to_upload = ["app.py", "requirements.txt"]
    
    # Also include the pre-trained model if it has been generated locally
    if os.path.exists("mnist_model.keras"):
        files_to_upload.append("mnist_model.keras")
        print("Found local 'mnist_model.keras' - adding to upload list.")
    else:
        print("Note: 'mnist_model.keras' not found. It will be trained on Hugging Face during the first run.")

    # Upload files
    print("\nUploading files...")
    for filename in files_to_upload:
        if os.path.exists(filename):
            print(f"Uploading {filename}...")
            try:
                api.upload_file(
                    path_or_fileobj=filename,
                    path_in_repo=filename,
                    repo_id=repo_id,
                    repo_type="space"
                )
                print(f"Successfully uploaded {filename}")
            except Exception as e:
                print(f"Error uploading {filename}: {e}")
        else:
            print(f"File {filename} not found, skipping.")

    print(f"\nDeployment Complete! View your space at: https://huggingface.co/spaces/{repo_id}")

if __name__ == "__main__":
    push_to_huggingface()
