const users = {
  4: {name: 'Mark'},
  5: {name: 'Paul'},
};

export default function get() {
  return new Promise((resolve) => {
    process.nextTick(() =>
      resolve(users)
    );
  });
}
