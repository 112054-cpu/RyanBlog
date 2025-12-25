const templates = [
  {
    title: '探索未知的旅程',
    content: `在這個充滿驚奇的世界裡，每一次的探索都是一場新的冒險。\n\n從清晨的第一縷陽光，到夜晚的星空璀璨，生活中處處都充滿著美好的瞬間。讓我們一起記錄下這些珍貴的時光，分享彼此的故事。\n\n無論是旅行的足跡，還是生活的點滴，每一個經歷都值得被珍藏。在這裡，我們用文字和影像，編織出屬於自己的精彩篇章。`
  },
  {
    title: '美食與生活的藝術',
    content: `美食不僅是味蕾的享受，更是一種生活的藝術。\n\n每一道菜餚背後，都蘊含著廚師的巧思與熱情。從食材的挑選到烹飪的技巧，每個細節都是對美味的追求。\n\n讓我們一起探索美食的世界，品味生活的美好，感受那些令人難忘的滋味。`
  },
  {
    title: '科技改變生活',
    content: `在這個數位時代，科技正以前所未有的速度改變著我們的生活方式。\n\n從智慧家居到人工智慧，從雲端運算到物聯網，科技的進步為我們帶來了無限可能。讓我們一起探討這些創新技術，思考它們如何塑造我們的未來。\n\n擁抱變化，與時俱進，在科技的浪潮中找到屬於自己的位置。`
  }
]

export function generateArticle() {
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return {
    title: randomTemplate.title,
    content: randomTemplate.content,
    excerpt: randomTemplate.content.substring(0, 150) + '...'
  }
}
