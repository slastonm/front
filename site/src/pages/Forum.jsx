import React, { useState, useEffect, useRef } from "react";
import "./Forum.css";

const Forum = () => {
  const postInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem("posts");
    if (stored) {
      setPosts(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const handlKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      createPost();
    }
  };
  const handlMediaChange = () => {
    const file = mediaInputRef.current.files[0];

    if (!file) {
      setPreview(null);
      return;
    }
    const fileType = file.type;
    const url = URL.createObjectURL(file);

    let media;
    if (fileType.startsWith("image/")) {
      media = <img src={url} alt="perview" />;
    } else if (fileType.startsWith("video/")) {
      media = <video src={url} controls />;
    } else if (fileType.startsWith("audio/")) {
      media = <audio src={url} controls />;
    }
    setPreview(media);
  };

  const createPost = () => {
    const postText = postInputRef.current.value.trim();
    const file = mediaInputRef.current.files[0];
    if (!postText && !file && editId === null) return;

    const fileType = file?.type;
    const url = file ? URL.createObjectURL(file) : null;
    let mediaType = null;

    if (fileType?.startsWith("image/")) mediaType = "image";
    else if (fileType?.startsWith("video/")) mediaType = "video";
    else if (fileType?.startsWith("audio/")) mediaType = "audio";

    if (editId !== null) {
      setPosts(
        posts.map((post) =>
          post.id === editId
            ? {
                ...post,
                text: postText,
                fileType: file ? mediaType : post.fileType,
                fileUrl: file ? url : post.fileUrl,
              }
            : post
        )
      );
      setEditId(null);
    } else {
      const newPost = {
        id: Date.now(),
        text: postText,
        fileType: mediaType,
        fileUrl: url,
      };
      setPosts([newPost, ...posts]);
    }
    postInputRef.current.value = "";
    mediaInputRef.current.value = "";
    setPreview(null);
  };

  const handleEdit = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      postInputRef.current.value = post.text;
      setEditId(postId);
    }
  };

  const handleDelete = (postId) => {
    const filtered = posts.filter((p) => p.id !== postId);
    setPosts(filtered);
  };

  const renderMedia = (post) => {
    if (!post.fileType || !post.fileUrl) return null;
    if (post.fileType === "image") {
      return <img src={post.fileUrl} alt="media" />;
    }
    if (post.fileType === "video") {
      return <video src={post.fileUrl} controls />;
    }
    if (post.fileType === "audio") {
      return <audio src={post.fileUrl} controls />;
    }
  };
  return (
    <div>
      <section className="post-writing">
        <label>Enter your post or select media:</label>
        <br />
        <textarea
          id="postInput"
          ref={postInputRef}
          onKeyDown={handlKeyPress}
          rows="4"
          cols="50"
          placeholder="Write something..."
        ></textarea>
        <br />
        <input
          ref={mediaInputRef}
          onChange={handlMediaChange}
          type="file"
          id="mediaInput"
        />
        <br />

        <button id="sendButton" onClick={createPost}>
          {editId !== null ? "Update" : "Send"}
        </button>
        <div id="preview">{preview}</div>
        <br />
      </section>

      <div id="posts">
        {posts.map((post) => (
          <div className="post-container" key={post.id}>
            {post.text && <p>{post.text}</p>}
            {renderMedia(post)}
            <div>
              <button onClick={() => handleEdit(post.id)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
