const PLACEHOLDER_IMAGE = 'https://placehold.co/900x600?text=AgroFresh';

const PRODUCT_IMAGE_BY_NAME = {
  "organic tomatoes": "https://images.unsplash.com/photo-1546470427-0d4e0f5b3e3e?auto=format&fit=crop&w=800&q=80",
  "green spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
  "potatoes": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
  "red onions": "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
  "green chillies": "https://images.unsplash.com/photo-1588891532022-ad32c01a7bd7?auto=format&fit=crop&w=800&q=80",
  "cauliflower": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80",
  "brinjal (eggplant)": "https://images.unsplash.com/photo-1659261200833-ec8761558af7?auto=format&fit=crop&w=800&q=80",
  "lady finger (okra)": "https://images.unsplash.com/photo-1567375698348-0d10baa8cae2?auto=format&fit=crop&w=800&q=80",
  "capsicum (bell pepper)": "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&w=800&q=80",
  "carrots": "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80",
  "peas (matar)": "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80",
  "coriander leaves": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=800&q=80",
  "cabbage": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80",
  "bottle gourd (lauki)": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  "farm mangoes (alphonso)": "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80",
  "bananas (robusta)": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
  "watermelon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
  "papaya": "https://images.unsplash.com/photo-1617112634259-50a0c1ad2a72?auto=format&fit=crop&w=800&q=80",
  "guava": "https://images.unsplash.com/photo-1637494511038-7e56ac8e1c68?auto=format&fit=crop&w=800&q=80",
  "pomegranate (bhagwa)": "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=80",
  "sweet lime (mosambi)": "https://images.unsplash.com/photo-1557800634-7de7b5e73cf4?auto=format&fit=crop&w=800&q=80",
  "grapes (thompson)": "https://images.unsplash.com/photo-1423757736953-61e1f6a92abe?auto=format&fit=crop&w=800&q=80",
  "coconut": "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=800&q=80",
  "chikoo (sapota)": "https://images.unsplash.com/photo-1561181286-d3f19344d753?auto=format&fit=crop&w=800&q=80",
  "brown rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
  "basmati rice": "https://images.unsplash.com/photo-1536304993881-ff86d42818e1?auto=format&fit=crop&w=800&q=80",
  "wheat flour (atta)": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
  "maize (corn)": "https://images.unsplash.com/photo-1601300100614-6b6a5dd9e5a8?auto=format&fit=crop&w=800&q=80",
  "black gram (urad dal)": "https://images.unsplash.com/photo-1585527697535-e9f01e07b18b?auto=format&fit=crop&w=800&q=80",
  "chickpeas (kabuli chana)": "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=800&q=80",
  "jowar (sorghum)": "https://images.unsplash.com/photo-1625944525533-4c1db97fad1e?auto=format&fit=crop&w=800&q=80",
  "bajra (pearl millet)": "https://images.unsplash.com/photo-1560806887-1735c0462745?auto=format&fit=crop&w=800&q=80",
  "turmeric powder": "https://images.unsplash.com/photo-1615485290382-441e4aa8a5d7?auto=format&fit=crop&w=800&q=80",
  "red chilli powder": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
  "coriander powder (dhaniya)": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=800&q=80",
  "cumin seeds (jeera)": "https://images.unsplash.com/photo-1559181567-c3190f787843?auto=format&fit=crop&w=800&q=80",
  "black pepper": "https://images.unsplash.com/photo-1506184109228-f0673f6ce2ee?auto=format&fit=crop&w=800&q=80",
  "cardamom (elaichi)": "https://images.unsplash.com/photo-1588671890052-30e48eeaa3ac?auto=format&fit=crop&w=800&q=80",
  "dry ginger powder (sunthi)": "https://images.unsplash.com/photo-1609205807107-6a1e49ef89ed?auto=format&fit=crop&w=800&q=80",
  "cloves (laung)": "https://images.unsplash.com/photo-1559181567-c3190f787843?auto=format&fit=crop&w=800&q=80",
  "mustard seeds": "https://images.unsplash.com/photo-1612204103590-b4e3b7c60e9a?auto=format&fit=crop&w=800&q=80",
  "cow milk (full cream)": "https://images.unsplash.com/photo-1563636619-e9143da7f009?auto=format&fit=crop&w=800&q=80",
  "free range eggs": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
  "a2 desi ghee": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
  "paneer (cottage cheese)": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  "buffalo curd (dahi)": "https://images.unsplash.com/photo-1488477181228-bf5b1f3fbb1c?auto=format&fit=crop&w=800&q=80",
  "buttermilk (chaas)": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80",
  "organic moringa leaves": "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=800&q=80",
  "organic amla (gooseberry)": "https://images.unsplash.com/photo-1586093021923-f4b9b9be2a2e?auto=format&fit=crop&w=800&q=80",
  "organic flaxseeds": "https://images.unsplash.com/photo-1585527697535-e9f01e07b18b?auto=format&fit=crop&w=800&q=80",
  "organic tulsi leaves": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
  "organic coconut sugar": "https://images.unsplash.com/photo-1558642891-54be180ea339?auto=format&fit=crop&w=800&q=80",
  "organic sesame seeds (til)": "https://images.unsplash.com/photo-1612204103590-b4e3b7c60e9a?auto=format&fit=crop&w=800&q=80",
  "organic dry figs (anjeer)": "https://images.unsplash.com/photo-1580827754766-4c13a9ef0368?auto=format&fit=crop&w=800&q=80",
};

const normalizeName = (name = "") => String(name).trim().toLowerCase();

export const getPrimaryProductImage = (product) => {
  const galleryImage = product?.images?.find((image) => image?.url)?.url;
  if (galleryImage) return galleryImage;

  const directImage = String(product?.imageUrl || "").trim();
  if (directImage) return directImage;

  const mappedImage = PRODUCT_IMAGE_BY_NAME[normalizeName(product?.name)];
  return mappedImage || PLACEHOLDER_IMAGE;
};

export const getProductGallery = (product) => {
  const images = Array.isArray(product?.images)
    ? product.images.filter((image) => image?.url)
    : [];

  if (images.length) return images;

  return [{ url: getPrimaryProductImage(product), public_id: "" }];
};

export { PLACEHOLDER_IMAGE };
