export default function TextPostForm({ title, setTitle, body, setBody }) {
  const maxTitleLength = 300;
  const maxBodyLength = 1500;

  const handleTitleChange = (e) => {
    if (e.target.value.length <= maxTitleLength) {
      setTitle(e.target.value);
    }
  };

  const handleBodyChange = (e) => {
    if (e.target.value.length <= maxBodyLength) {
      setBody(e.target.value);
    }
  };

  return (
    <>
      <label className="post-title-label" htmlFor="post-title">Title</label>
      <input className="post-title" autoComplete="off" id="post-title" type="text" value={title} onChange={handleTitleChange} />
      <span className="char-counter">{title.length}/{maxTitleLength}</span>
      <label className="text-body-label" htmlFor="text-body">Body</label>
      <textarea className="text-body" id="text-body" type="text" value={body} onChange={handleBodyChange} />
      <span className="char-counter">{body.length}/{maxBodyLength}</span>
    </>
  );
}