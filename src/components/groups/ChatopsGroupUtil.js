export const UserTypes = {
    owner : "OWNER",
    admin : "ADMINISTRATOR",
    member : "MEMBER"
}

export const isUniqueGroup = async (grpName) => {
    try {
      const res = await fetch("/mui/uniqueGroup/" + grpName);
      if (res.status == 200) {
        const { unique } = await res.json();
        return unique;
      } 
    } catch (error) {
      return false;
    }
  };
export const isUniqueGroupUser = async (groupId, email, userType) => {
    const grpData = {
        groupId,
        email,
        userType
    }
    try {
      const res = await fetch("/mui/uniqueGroupUser", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(grpData),
      })
      if (res.status == 200) {
        const { unique } = await res.json();
        return unique;
      } 
    } catch (error) {
      return false;
    }
  };

// export default  UserType;