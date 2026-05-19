(() => {
  "use strict";

  function createResultMessages({ operationLabels, fastSeconds, formatTime }) {
    function createResultComms({ accuracy, weakSkill }) {
      if (accuracy >= 90) {
        return "繝溘ャ繧ｷ繝ｧ繝ｳ螟ｧ謌仙粥縲ゅｆ繝ｼ繧翫・闊ｪ陦後Ο繧ｰ縺ｫ繧ゅ√°縺ｪ繧雁ｮ牙ｮ壹▲縺ｦ險倬鹸縺励※縺翫￥縺ｭ縲・";
      }

      if (weakSkill) {
        return `${operationLabels[weakSkill]}縺ｮ菫｡蜿ｷ縺悟ｰ代＠謠ｺ繧後※繧九ｈ縲よｬ｡縺ｯ縺昴％繧堤洒縺丞渚蠕ｩ縺励ｈ縺・`;
      }

      return "繝溘ャ繧ｷ繝ｧ繝ｳ螳御ｺ・よｬ｡縺ｮ荳谿ｵ縺瑚ｦ九∴縺ｦ縺阪◆繧医ゅΟ繧ｰ繧定ｦ九※謨ｴ縺医※縺・％縺・・";
    }

    function getResultTitle({ accuracy, level }) {
      if (accuracy >= 90 && level >= 5) {
        return "逋ｺ螻墓弌蝓溘↓騾ｲ繧√ｋ繝ｬ繝吶Ν";
      }
      if (accuracy >= 70) {
        return "蝓ｺ遉手ｻ碁％縺悟ｮ牙ｮ壹＠縺ｦ縺・ｋ繝ｬ繝吶Ν";
      }
      if (accuracy >= 50) {
        return "繧ゅ≧蟆代＠闊ｪ陦檎ｷｴ鄙偵〒莨ｸ縺ｳ繧九Ξ繝吶Ν";
      }
      return "蝓ｺ遉弱せ繝・・繧ｷ繝ｧ繝ｳ縺九ｉ謨ｴ縺医◆縺・Ξ繝吶Ν";
    }

    function createResultSummary({ accuracy, averageTime, weakSkill }) {
      const pace = averageTime <= fastSeconds ? "繝・Φ繝昴ｈ縺・" : "縺倥▲縺上ｊ";

      if (!weakSkill) {
        return `豁｣遲皮紫縺ｯ${accuracy}%縺ｧ縺励◆縲ょ・菴鍋噪縺ｫ${pace}遲斐∴繧峨ｌ縺ｦ縺・※縲∬ｨ育ｮ励・蛻・焚繝ｻ蜑ｲ蜷医・譁・ｭ怜ｼ上・蜈･蜿｣繧偵ヰ繝ｩ繝ｳ繧ｹ繧医￥遒ｺ隱阪〒縺阪※縺・∪縺吶`;
      }

      return `豁｣遲皮紫縺ｯ${accuracy}%縺ｧ縺励◆縲・{pace}蜿悶ｊ邨・ａ縺ｦ縺・∪縺吶よｬ｡縺ｯ${operationLabels[weakSkill]}繧帝㍾轤ｹ逧・↓邱ｴ鄙偵☆繧九→縲√＆繧峨↓螳牙ｮ壹＠縺ｾ縺吶`;
    }

    function createTimeLimitResultSummary({ accuracy, weakSkill, answeredCount, questionTotal, timeLimitSeconds }) {
      const weakText = weakSkill ? ` 迚ｹ縺ｫ${operationLabels[weakSkill]}繧堤洒縺丞ｾｩ鄙偵☆繧九→螳牙ｮ壹＠縺昴≧縺ｧ縺吶` : "";

      return `${formatTime(timeLimitSeconds)}縺ｧ${answeredCount}/${questionTotal}蝠上↓謖第姶縺励∵ｭ｣遲皮紫縺ｯ${accuracy}%縺ｧ縺励◆縲よ凾髢灘宛髯舌▽縺阪・Stage 1縲・蠕ｩ鄙偵Ο繧ｰ縺ｧ縺吶・{weakText}`;
    }

    function createCurrentPositionText({ accuracy, averageTime, level }) {
      if (accuracy >= 80 && level >= 5 && averageTime <= fastSeconds) {
        return "蟆丞ｭｦ譬｡鬮伜ｭｦ蟷ｴ縺九ｉ荳ｭ蟄ｦ蜈･蜿｣縺ｮ蜀・ｮｹ縺ｾ縺ｧ縲・溘＆縺ｨ豁｣遒ｺ縺輔′縺九↑繧雁ｮ牙ｮ壹＠縺ｦ縺・∪縺吶よｬ｡縺ｯ譁・ｫ鬘後ｄ隍・粋蝠城｡後↓騾ｲ繧√∪縺吶・";
      }

      if (accuracy >= 70) {
        return "蝓ｺ譛ｬ險育ｮ励・縺翫♀繧縺ｭ螳牙ｮ壹＠縺ｦ縺・∪縺吶ょ・謨ｰ繝ｻ蜑ｲ蜷医・譁・ｭ怜ｼ上・蜈･蜿｣繧呈ｷｷ縺懊※繧ゅ∬誠縺｡逹縺・※蜃ｦ逅・〒縺阪ｋ谿ｵ髫弱〒縺吶・";
      }

      if (accuracy >= 50) {
        return "蝓ｺ譛ｬ險育ｮ励・驛ｨ蛻・噪縺ｫ縺ｧ縺阪※縺・∪縺吶よ･縺ｫ蛻・㍽縺悟､峨ｏ繧九→霑ｷ縺・ｄ縺吶＞縺ｮ縺ｧ縲∫洒縺・渚蠕ｩ縺ｧ蝨溷床繧貞崋繧√ｋ谿ｵ髫弱〒縺吶・";
      }

      return "縺ｾ縺壹・謨ｴ謨ｰ縺ｮ蝗帛援貍皮ｮ励→縲∝・謨ｰ繝ｻ蜑ｲ蜷医・諢丞袖繧堤｢ｺ隱阪☆繧区ｮｵ髫弱〒縺吶よｭ｣遒ｺ縺輔ｒ蜆ｪ蜈医＠縺ｦ騾ｲ繧√ｋ縺ｨ莨ｸ縺ｳ繧・☆縺・〒縺吶・";
    }

    function createStrengthText({ strongSkills }) {
      if (strongSkills.length === 0) {
        return "莉雁屓縺ｯ縺ｯ縺｣縺阪ｊ蠕玲э縺ｨ險縺・・繧後ｋ蛻・㍽縺ｯ縺ｾ縺蟆代↑繧√〒縺吶よｬ｡蝗槭・豁｣遲皮紫80%莉･荳翫°縺､蟷ｳ蝮・遘剃ｻ･蜀・・蛻・㍽繧貞｢励ｄ縺励※縺・″縺ｾ縺励ｇ縺・・";
      }

      return `${strongSkills.map((name) => operationLabels[name]).join("縲・")}縺ｯ螳牙ｮ壹＠縺ｦ縺・∪縺吶よｭ｣遲皮紫縺ｨ隗｣遲斐せ繝斐・繝峨・荳｡譁ｹ縺後ｈ縺上∵ｬ｡縺ｮ繝ｬ繝吶Ν縺ｸ騾ｲ繧√ｋ蛟呵｣懊〒縺吶`;
    }

    function createWatchText({ watchSkills }) {
      if (watchSkills.length === 0) {
        return "螟ｧ縺阪￥蟠ｩ繧後※縺・ｋ蛻・㍽縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲よ悴蜃ｺ鬘後・蛻・㍽縺後≠繧句ｴ蜷医・縲∵ｬ｡蝗槭◎縺薙∪縺ｧ遒ｺ隱阪☆繧九→險ｺ譁ｭ邊ｾ蠎ｦ縺御ｸ翫′繧翫∪縺吶・";
      }

      return `${watchSkills.map((name) => operationLabels[name]).join("縲・")}縺ｯ蟆代＠豕ｨ諢上〒縺吶ゆｸ肴ｭ｣隗｣縲√∪縺溘・譎る俣縺後°縺九▲縺溷撫鬘後′縺ゅｋ縺溘ａ縲∝渕遉主撫鬘後〒遒ｺ隱阪☆繧九→繧医＆縺昴≧縺ｧ縺吶`;
    }

    function createNextStepText({ accuracy, weakSkill, watchSkills, level }) {
      const target = weakSkill || watchSkills[0];

      if (target) {
        return `谺｡縺ｯ${operationLabels[target]}繧偵∵ｭ｣遒ｺ縺募━蜈医〒3蝠城｣邯壽ｭ｣隗｣縺吶ｋ縺ｨ縺薙ｍ縺九ｉ蟋九ａ縺ｾ縺励ｇ縺・よ・繧後◆繧・遘剃ｻ･蜀・ｒ逶ｮ讓吶↓縺吶ｋ縺ｨ縲∵ｬ｡縺ｮ谿ｵ縺ｫ騾ｲ縺ｿ繧・☆縺上↑繧翫∪縺吶`;
      }

      if (accuracy >= 80 && level >= 5) {
        return "谺｡縺ｯ蛻・焚繝ｻ蜑ｲ蜷医・譁・ｭ怜ｼ上′豺ｷ縺悶ｋ蝠城｡後↓騾ｲ縺ｿ縺ｾ縺励ｇ縺・りｧ｣縺肴婿繧貞・繧頑崛縺医ｋ騾溘＆縺後∵ｬ｡縺ｮ莨ｸ縺ｳ縺励ｍ縺ｫ縺ｪ繧翫∪縺吶・";
      }

      if (accuracy >= 70) {
        return "谺｡縺ｯ蟆代＠縺縺第焚蟄励ｒ螟ｧ縺阪￥縺励※縲∝酔縺俶ｭ｣遒ｺ縺輔ｒ菫昴▽邱ｴ鄙偵〒縺吶る溘＆繧医ｊ繧ゅ∬ｦ狗峩縺励↑縺励〒蠖薙※繧九％縺ｨ繧堤岼讓吶↓縺励∪縺励ｇ縺・・";
      }

      return "谺｡縺ｯ謨ｴ謨ｰ縺ｮ縺溘＠邂励・縺ｲ縺咲ｮ励・縺九￠邂励ｒ遏ｭ縺丞渚蠕ｩ縺励∪縺励ｇ縺・ょ悄蜿ｰ縺後◎繧阪≧縺ｨ縲∝・謨ｰ繧・牡蜷医ｂ縺九↑繧頑･ｽ縺ｫ縺ｪ繧翫∪縺吶・";
    }

    return {
      createResultComms,
      getResultTitle,
      createResultSummary,
      createTimeLimitResultSummary,
      createCurrentPositionText,
      createStrengthText,
      createWatchText,
      createNextStepText,
    };
  }

  window.MathFitResultMessages = {
    createResultMessages,
  };
})();
