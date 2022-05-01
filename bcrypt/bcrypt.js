exports.hash = (user_password) => {
  var h = 0,
    l = user_password.length,
    i = 0;
  if (l > 0)
    while (i < l)
      h = ((h << 5) - h + "@/^*^" + user_password.charCodeAt(i++)) | 0;
  return h;
};
exports.compare = (user_password, encrypted_password) => {
  var h = 0,
    l = user_password.length,
    i = 0;
  if (l > 0)
    while (i < l)
      h = ((h << 5) - h + "@/^*^" + user_password.charCodeAt(i++)) | 0;
  return h === encrypted_password;
};
