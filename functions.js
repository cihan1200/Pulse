import axios from "axios";

const editProfilePicture = (setProfilePicture, setProfilePictureFile) => {
  const saveButton = document.querySelector(".save");
  const cancelButton = document.querySelector(".cancel");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
      saveButton.classList.remove("deactive");
      cancelButton.classList.remove("deactive");
    }
  };
  fileInput.click();
};

const editUserName = () => {
  document.querySelector(".new-about-field-container").classList.add("hide");
  document.querySelector(".new-username-input-container").classList.remove("hide");
};

const editAbout = () => {
  document.querySelector(".new-username-input-container").classList.add("hide");
  document.querySelector(".new-about-field-container").classList.remove("hide");
};

const cancelChanges = (setLoading, setTrigger) => {
  setLoading(true);
  setTrigger(prev => !prev);
};

const saveChanges = async ({ userId, newUserName, newAbout, profilePictureFile, setLoading, setTrigger }) => {
  const saveButton = document.querySelector(".save");
  if (saveButton.classList.contains("deactive")) return;

  const requests = [];

  if (newUserName.trim() !== "") {
    requests.push(
      axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/username`, { newUsername: newUserName })
    );
  }

  if (newAbout.trim() !== "") {
    requests.push(
      axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/about`, { newAbout })
    );
  }

  if (profilePictureFile) {
    const formData = new FormData();
    formData.append("profilePicture", profilePictureFile);
    requests.push(
      axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/profile-picture`, formData)
    );
  }

  if (requests.length === 0) return;

  try {
    setLoading(true);
    await Promise.all(requests);
    setTrigger(prev => !prev);
  } catch (error) {
    console.error("Error saving changes:", error);
  } finally {
    setLoading(false);
  }
};

const rejectUserNameChanges = () => {
  document.querySelector(".new-username-input-container").classList.add("hide");
};

const applyUserNameChanges = (setUserName) => {
  const input = document.querySelector(".new-username-input");
  if (input && input.value.trim() !== "") {
    setUserName(input.value.trim());
  }
  document.querySelector(".new-username-input-container").classList.add("hide");
  document.querySelector(".save").classList.remove("deactive");
  document.querySelector(".cancel").classList.remove("deactive");
};

const applyAboutChanges = (setAbout) => {
  const textarea = document.querySelector(".new-about-field");
  if (textarea && textarea.value.trim() !== "") {
    setAbout(textarea.value.trim());
  }
  document.querySelector(".new-about-field-container").classList.add("hide");
  document.querySelector(".save").classList.remove("deactive");
  document.querySelector(".cancel").classList.remove("deactive");
};

const rejectAboutChanges = () => {
  document.querySelector(".new-about-field-container").classList.add("hide");
};

export {
  editProfilePicture,
  editUserName,
  editAbout,
  cancelChanges,
  saveChanges,
  rejectUserNameChanges,
  applyUserNameChanges,
  applyAboutChanges,
  rejectAboutChanges
};
