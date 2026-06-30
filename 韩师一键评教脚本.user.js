// ==UserScript==
// @name         韩师一键评教脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  强制显示按钮，点击后自动评教，增强兼容性与容错率
// @author       sheemia
// @match        *://*/*eams/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    if (document.getElementById('iframeMain')) {
        console.log("拦截：外层框架不添加按钮");
        return;
    }

    console.log("🚀 评教脚本已启动！");

    // 1. 创建并美化按钮
    const btn = document.createElement("button");
    btn.innerHTML = "🚀 一键教评";
    Object.assign(btn.style, {
        position: "fixed",
        top: "15px",
        right: "15px",
        zIndex: "2147483647",
        padding: "10px 18px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        fontSize: "15px",
        fontWeight: "bold",
        transition: "all 0.3s"
    });

    btn.onmouseover = () => btn.style.backgroundColor = "#218838";
    btn.onmouseout = () => btn.style.backgroundColor = "#28a745";

    // 2. 核心点击逻辑
    btn.onclick = function() {
        console.log("开始执行评教逻辑...");
        let count = 0;
        const labels = Array.from(document.getElementsByTagName("label"));

        // --- 策略A：匹配所有包含“优”的选项 ---
        // 使用 includes 防止前后有隐藏的空白字符
        const excellentLabels = labels.filter(label => label.innerText.trim().includes("优"));
        excellentLabels.forEach(label => {
            label.click();
            count++;
        });

        // --- 策略B：将最后一个改为“良” ---
        for (let i = labels.length - 1; i >= 0; i--) {
            if (labels[i].innerText.trim().includes("良")) {
                labels[i].click();
                break; // 只点最后一个
            }
        }

        // --- 策略C：文本框填空 ---
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach(ta => ta.value = "很好，无建议。");

        // --- 策略D：拦截弹窗并提交 ---
        // 备份原生弹窗函数
        const originalConfirm = window.confirm;
        const originalAlert = window.alert;

        window.confirm = () => true;
        window.alert = () => true;

        // 尝试多种常见的提交按钮 ID 或 Class
        const submitBtn = document.getElementById("sub") ||
                          document.getElementById("submit") ||
                          document.querySelector("input[type='submit']") ||
                          document.querySelector("button[type='submit']");

        if (submitBtn) {
            submitBtn.click();
        } else {
            console.warn("⚠️ 未找到提交按钮，请手动点击提交");
        }

        // 3秒后恢复原生弹窗函数，防止破坏页面其他功能
        setTimeout(() => {
            window.confirm = originalConfirm;
            window.alert = originalAlert;
        }, 3000);

        // --- 反馈结果 ---
        if (count > 0 || textareas.length > 0) {
            btn.innerHTML = "✅ 已完成";
            btn.style.backgroundColor = "#007bff";
            setTimeout(() => {
                btn.innerHTML = "🚀 一键教评";
                btn.style.backgroundColor = "#28a745";
            }, 2500);
        } else {
            originalAlert.call(window, "❌ 没找到选项！请确认是否在评教页面内，或者页面元素尚未加载完毕。");
        }
    };

    // 3. 安全挂载按钮
    const appendButton = () => {
        if (!document.body.contains(btn)) {
            document.body.appendChild(btn);
        }
    };

    if (document.body) {
        appendButton();
    } else {
        window.addEventListener('DOMContentLoaded', appendButton);
    }
})();